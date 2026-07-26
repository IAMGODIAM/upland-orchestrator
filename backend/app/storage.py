from __future__ import annotations

from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Iterator

from sqlalchemy import DateTime, Integer, String, Text, create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker


class Base(DeclarativeBase):
    pass


class Connection(Base):
    __tablename__ = "upland_connections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    owner: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    connection_code: Mapped[str] = mapped_column(String(256), default="")
    status: Mapped[str] = mapped_column(String(32), default="pending")
    upland_user_id: Mapped[str] = mapped_column(String(256), default="")
    encrypted_access_token: Mapped[str] = mapped_column(Text, default="")
    profile_json: Mapped[str] = mapped_column(Text, default="{}")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class WebhookEvent(Base):
    __tablename__ = "upland_webhook_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    event_type: Mapped[str] = mapped_column(String(128), index=True)
    transaction_id: Mapped[str] = mapped_column(String(256), default="", index=True)
    payload_json: Mapped[str] = mapped_column(Text)
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class Store:
    def __init__(self, database_url: str) -> None:
        connect_args = {"check_same_thread": False} if database_url.startswith("sqlite") else {}
        self.engine = create_engine(database_url, connect_args=connect_args, future=True)
        self.sessions = sessionmaker(self.engine, expire_on_commit=False)

    def initialize(self) -> None:
        Base.metadata.create_all(self.engine)

    @contextmanager
    def session(self) -> Iterator[Session]:
        with self.sessions() as session:
            yield session
            session.commit()

    def connection_for(self, owner: str) -> Connection | None:
        with self.session() as session:
            return session.scalar(select(Connection).where(Connection.owner == owner))

    def upsert_connection(self, owner: str, **values: str) -> Connection:
        with self.session() as session:
            connection = session.scalar(select(Connection).where(Connection.owner == owner))
            if connection is None:
                connection = Connection(owner=owner)
                session.add(connection)
            for key, value in values.items():
                setattr(connection, key, value)
            session.flush()
            return connection

    def has_webhook_event(self, event_type: str, transaction_id: str) -> bool:
        if not transaction_id:
            return False
        with self.session() as session:
            return session.scalar(select(WebhookEvent.id).where(WebhookEvent.event_type == event_type, WebhookEvent.transaction_id == transaction_id)) is not None

    def record_webhook_event(self, event_type: str, transaction_id: str, payload_json: str) -> None:
        with self.session() as session:
            session.add(WebhookEvent(event_type=event_type, transaction_id=transaction_id, payload_json=payload_json))

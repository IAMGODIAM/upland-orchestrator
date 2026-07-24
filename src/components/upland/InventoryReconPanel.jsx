import { useState } from 'react';
import useInventoryRecon from '@/hooks/useInventoryRecon';
import ReconSearchBar from '@/components/upland/ReconSearchBar';
import ReconSummary from '@/components/upland/ReconSummary';
import ReconResults from '@/components/upland/ReconResults';
import ReconWatchlist from '@/components/upland/ReconWatchlist';

export default function InventoryReconPanel() {
  const [cityName,setCityName]=useState('');
  const recon=useInventoryRecon();
  return <div className="mx-auto max-w-[1500px] px-5 py-8"><header className="mb-6"><p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">Inventory Recon</p><h2 className="mt-3 font-display text-4xl font-medium sm:text-5xl">Find the signal before the crowd.</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">Rank city inventory with a balanced value, yield, and liquidity score, then move candidates through a persistent watchlist.</p></header><ReconSummary results={recon.results} watchlist={recon.watchlist} city={recon.city}/><div className="mt-6"><ReconSearchBar value={cityName} onChange={setCityName} onScan={recon.scan} loading={recon.loading}/></div><div className="mt-5"><ReconResults results={recon.results} watchlist={recon.watchlist} searched={recon.searched} error={recon.error} onSave={recon.save}/></div><div className="my-8 border-t border-border"/><ReconWatchlist items={recon.watchlist} onUpdate={recon.update} onRemove={recon.remove}/></div>;
}
import { Building2, Gem, Map, MapPin, Store, Trophy, Waypoints } from 'lucide-react';

export const worldDataTools = [
  { id: 'properties', title: 'Properties', description: 'Addresses, neighborhoods, status, and mint price.', endpoint: '/v2/properties', icon: Building2, columns: [['address','Address'],['neighborhood.name','Neighborhood'],['status','Status'],['mintPrice','Mint price']] },
  { id: 'neighborhoods', title: 'Neighborhoods', description: 'Every named district available in a city.', endpoint: '/neighborhoods', icon: MapPin, columns: [['name','Neighborhood'],['area','Area'],['id','Reference']] },
  { id: 'tracks', title: 'Race tracks', description: 'Tracks, distance, surface, weather, and laps.', endpoint: '/tracks', icon: Waypoints, columns: [['name','Track'],['distance','Distance'],['surface','Surface'],['laps','Laps']] },
  { id: 'collections', title: 'Collections', description: 'Property collections and their ownership requirements.', endpoint: '/collections', icon: Trophy, columns: [['name','Collection'],['requirements','Requirement'],['yieldBoost','Yield boost'],['oneTimeReward','Reward']] },
  { id: 'treasures', title: 'Treasure activity', description: 'Recent treasure discoveries within a city.', endpoint: '/treasures-history', icon: Gem, columns: [['userName','Player'],['fullAddress','Location'],['treasureType','Type'],['reward','Reward']] },
  { id: 'cities', title: 'Cities', description: 'Find an Upland city and its regional information.', endpoint: '/cities', icon: Map, columns: [['name','City'],['stateName','Region'],['countryName','Country'],['id','Reference']] },
  { id: 'devshops', title: 'Developer shops', description: 'Shops connected to this Upland application.', endpoint: '/devshops', icon: Store, noCity: true, columns: [['name','Shop'],['description','Description'],['appUrl','Website'],['id','Reference']] }
];
import MandiPrice from '../models/MandiPrice.js';
import { db } from '../config/db.js';
import axios from 'axios';

// Calculate distance in km between two sets of coordinates using Haversine formula
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// 1. GET ALL MANDI PRICES WITH OPTIONAL FILTERS
export const getPrices = async (req, res) => {
  const { cropName, state, district } = req.query;
  const filter = {};

  if (cropName) filter.cropName = cropName;
  if (state) filter.state = state;
  if (district) filter.district = district;

  const apiKey = process.env.DATAGOV_API_KEY;

  if (apiKey && state && district) {
    console.log('[Mandi API] Attempting data.gov.in Agmarknet API integration...');
    try {
      const resourceId = '9ef842f6-875f-4d1a-8111-e4e6412341a4';
      let url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=20`;
      url += `&filters[state]=${encodeURIComponent(state)}&filters[district]=${encodeURIComponent(district)}`;
      if (cropName) {
        url += `&filters[commodity]=${encodeURIComponent(cropName)}`;
      }

      const response = await axios.get(url);
      const records = response.data.records || [];

      if (records.length > 0) {
        console.log(`[Mandi API] Successfully fetched ${records.length} records from data.gov.in`);
        
        const mappedList = records.map((rec, index) => {
          const basePrice = parseInt(rec.modal_price) || 2000;
          const priceHistory = Array.from({ length: 12 }, (_, i) => {
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const variance = Math.sin(i) * (basePrice * 0.05);
            return {
              month: months[i],
              price: Math.round(basePrice + variance)
            };
          });

          return {
            _id: `live-mandi-${index}-${rec.market.toLowerCase().replace(/\s+/g, '-')}`,
            cropName: rec.commodity || 'Wheat',
            state: rec.state,
            district: rec.district,
            market: rec.market || `${rec.district} Mandi`,
            currentPrice: basePrice,
            latitude: parseFloat(rec.latitude) || 22.719 + (index * 0.01),
            longitude: parseFloat(rec.longitude) || 75.857 + (index * 0.01),
            priceHistory,
            expectedTrend: 'STABLE',
            trendReasoning: 'Pricing synced live from Agmarknet portal.'
          };
        });

        return res.status(200).json(mappedList);
      } else {
        console.log('[Mandi API] No records found for current location. Falling back to local data.');
      }
    } catch (err) {
      console.warn('[Mandi API] Request to data.gov.in failed. Falling back to database/mock:', err.message);
    }
  }

  // Fallback to local / mock
  try {
    let list = await db.find(MandiPrice, filter);

    if (list.length === 0 && state && district) {
      const crops = cropName ? [cropName] : ['Wheat', 'Paddy (Rice)', 'Soybean', 'Cotton', 'Onion', 'Potato', 'Mustard', 'Sugarcane', 'Barley'];
      
      const mockList = crops.map(crop => {
        let basePrice = 2200;
        let trendReason = 'Good supply and standard demand channels keep pricing stable.';
        
        if (crop === 'Wheat') {
          basePrice = 2275;
          trendReason = `Expected harvest reports in ${state} indicate strong trading margins.`;
        } else if (crop === 'Paddy (Rice)') {
          basePrice = 2100;
          trendReason = 'Procurement targets announced by State agencies are supporting local market arrivals.';
        } else if (crop === 'Cotton') {
          basePrice = 6400;
          trendReason = 'Textile demand increases pricing outlook across major export hubs.';
        } else if (crop === 'Soybean') {
          basePrice = 4500;
          trendReason = 'Oil refinery demand remains firm, driving steady price increments.';
        } else if (crop === 'Onion') {
          basePrice = 1900;
          trendReason = 'Slight seasonal shortage in arrivals supporting moderate price surges.';
        } else if (crop === 'Potato') {
          basePrice = 1400;
          trendReason = 'Bulk cold-storage supply holds prices at stable levels.';
        } else if (crop === 'Mustard') {
          basePrice = 5650;
          trendReason = 'Oilseed crushing mills are showing strong purchase support.';
        } else if (crop === 'Sugarcane') {
          basePrice = 340;
          trendReason = 'FRP revisions by the state government support sugar mill procurement.';
        } else if (crop === 'Barley') {
          basePrice = 2050;
          trendReason = 'Steady demand from malting plants maintains steady trading ranges.';
        }

        const priceHistory = Array.from({ length: 12 }, (_, i) => {
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const variance = Math.sin(i) * (basePrice * 0.05);
          return {
            month: months[i],
            price: Math.round(basePrice + variance)
          };
        });

        let hash = 0;
        const key = `${district}, ${state}`;
        for (let i = 0; i < key.length; i++) {
          hash = key.charCodeAt(i) + ((hash << 5) - hash);
        }
        const lat = 15.0 + Math.abs((hash % 150) / 10);
        const lon = 73.0 + Math.abs(((hash >> 8) % 120) / 10);

        return {
          _id: `mock-mandi-${crop.replace(/\s+/g, '-')}-${district.toLowerCase()}`,
          cropName: crop,
          state,
          district,
          market: `${district} Mandi`,
          currentPrice: basePrice,
          latitude: parseFloat(lat.toFixed(4)),
          longitude: parseFloat(lon.toFixed(4)),
          priceHistory,
          expectedTrend: hash % 2 === 0 ? 'UP' : 'STABLE',
          trendReasoning: trendReason
        };
      });

      return res.status(200).json(mockList);
    }

    return res.status(200).json(list);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve mandi prices', details: err.message });
  }
};


// 2. GET NEAREST MANDIS BASED ON FARMER COORDINATES
export const getNearestMandis = async (req, res) => {
  const { lat, lon, cropName } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and longitude coordinates are required' });
  }

  const userLat = parseFloat(lat);
  const userLon = parseFloat(lon);

  try {
    const filter = {};
    if (cropName) filter.cropName = cropName;

    let allMarkets = await db.find(MandiPrice, filter);

    if (allMarkets.length === 0) {
      const crops = cropName ? [cropName] : ['Wheat', 'Paddy (Rice)', 'Soybean', 'Cotton', 'Onion', 'Potato', 'Mustard', 'Sugarcane', 'Barley'];
      allMarkets = crops.map((crop, idx) => {
        let basePrice = 2200;
        if (crop === 'Wheat') basePrice = 2275;
        if (crop === 'Cotton') basePrice = 6400;
        if (crop === 'Mustard') basePrice = 5650;

        return {
          _id: `mock-near-${idx}`,
          cropName: crop,
          state: 'Local Region',
          district: 'Nearby Mandi',
          market: `${crop} Market Centroid`,
          currentPrice: basePrice,
          latitude: userLat + (idx * 0.005) - 0.01,
          longitude: userLon + (idx * 0.003) - 0.005,
          priceHistory: [],
          expectedTrend: 'STABLE',
          trendReasoning: 'Consistent supply flow.'
        };
      });
    }

    // Calculate distance and add to market object
    const sortedMarkets = allMarkets
      .map(market => {
        const item = market.toObject ? market.toObject() : market;
        const distance = getDistance(userLat, userLon, item.latitude || 22.0, item.longitude || 75.0);
        return { ...item, distance: parseFloat(distance.toFixed(2)) };
      })
      .sort((a, b) => a.distance - b.distance);

    return res.status(200).json(sortedMarkets.slice(0, 5));
  } catch (err) {
    return res.status(500).json({ error: 'Failed to locate nearby mandis', details: err.message });
  }
};

// 3. GET DYNAMIC MARKET PRICE HISTORY FOR SPECIFIC CROP / LOCATION
export const getPriceDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const detail = await db.findOne(MandiPrice, { _id: id });
    if (!detail) {
      return res.status(404).json({ error: 'Mandi price entry not found' });
    }
    return res.status(200).json(detail);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch details', details: err.message });
  }
};

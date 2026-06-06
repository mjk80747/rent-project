import express from 'express';
import cors from 'cors';
import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import connectDB from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const normalizeOrigin = (value) => {
  if (!value) return null;

  const trimmed = value.trim().replace(/\/$/, '');
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return `https://${trimmed}`;
};

const getAllowedOrigins = () => {
  const origins = new Set([
    normalizeOrigin(process.env.FRONTEND_URL),
    normalizeOrigin(process.env.VERCEL_URL),
    normalizeOrigin(process.env.VERCEL_BRANCH_URL),
    normalizeOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL),
  ].filter(Boolean));

  return origins;
};

const isVercelAppOrigin = (origin) => {
  try {
    const { hostname } = new URL(origin);
    return hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
};

const isOriginAllowed = (origin) => {
  if (!origin) return true;

  const normalizedOrigin = origin.replace(/\/$/, '');

  if (process.env.VERCEL && isVercelAppOrigin(normalizedOrigin)) {
    return true;
  }

  return getAllowedOrigins().has(normalizedOrigin);
};

const app = express();
app.use(cors({
  origin: function(origin, callback) {
    if (process.env.NODE_ENV !== 'production') {
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('192.168')) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
      return;
    }

    if (isOriginAllowed(origin)) {
      callback(null, true);
      return;
    }

    console.error('Blocked CORS origin:', origin, 'Allowed:', [...getAllowedOrigins()]);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());

app.use(async (req, res, next) => {
  if (!req.path.startsWith('/api/auth')) {
    return next();
  }

  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection failed:', error.message);
    res.status(503).json({
      success: false,
      message: 'Database connection failed. Please try again later.',
    });
  }
});

// Auth routes
app.use('/api/auth', authRoutes);

const filesToProcess = [
  'Bellandur.csv',
  'Electronic_City.csv',
  'K.R Puram.csv',
  'Varthur.csv',
  'Yelahanka.csv',
  'Kaggadasapura.csv',
  'Brookefield.csv',
  'Whitefield.csv'
];

let images = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
];

const resolveCSVPath = (filename) => {
  const possiblePaths = [
    path.join(process.cwd(), filename),
    path.join(__dirname, filename),
    path.join(__dirname, '..', filename),
    path.join('/var/task', filename)
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
};

// Reusable function to parse a single CSV
const parseCSV = (filename) => {
  return new Promise((resolve, reject) => {
    const filePath = resolveCSVPath(filename);
    if (!filePath) {
      console.warn(`File not found in any known locations: ${filename}`);
      return resolve([]);
    }
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
};
let properties = [];

const initDb = new Promise((resolve) => {
  (async () => {
    console.log("Setting up properties from CSV...");
    const newProperties = [];
    let totalInserted = 0;
    
    for (const file of filesToProcess) {
      try {
        const rows = await parseCSV(file); // Grab all rows per file
        let areaName = path.basename(file, '.csv').replace('_', ' ');

        rows.forEach((row, i) => {
          let uniqueId = (row.property_id || '') + '_' + Date.now() + Math.random().toString().slice(2, 6);
          
          let typeStr = row.type || 'BHK2';
          let bedroomsMatch = typeStr.match(/\d+/);
          let bedrooms = bedroomsMatch ? parseInt(bedroomsMatch[0]) : 2;
          let bathrooms = parseInt(row.bathroom) || 2;
          
          let title = `${row.furnishing ? row.furnishing.replace('_', ' ') : 'Premium'} ${typeStr} PG`;
          let location = `${row.locality || 'Bangalore'}, Bangalore (${row.pin_code || ''})`;
          let price = `₹${row.rent || '20000'} / month`;
          let area = `${row.property_size || '1000'} sq.ft`;
          let featured = i < 2 ? 1 : 0; // Feature first 2 from each file
          
          // Pick an image reliably
          let img = images[(totalInserted + i) % images.length];
          let detailsJSON = JSON.stringify(row);

          newProperties.push({
            id: uniqueId,
            title,
            location,
            price,
            bedrooms,
            bathrooms,
            area,
            image: img,
            featured,
            area_name: areaName,
            details: detailsJSON
          });
          totalInserted++;
        });
        console.log(`Processed ${rows.length} rows from ${file}`);
      } catch (err) {
        console.error(`Error processing ${file}:`, err);
      }
    }
    properties = newProperties;
    console.log(`Successfully completed! Loaded a total of ${totalInserted} property records into memory.`);
    resolve();
  })();
});

// Search and Read properties
app.get('/api/properties', async (req, res) => {
  try {
    await initDb;
    const { search } = req.query;
    let results = properties;
    
    if (search) {
      const query = search.toLowerCase();
      results = properties.filter(r => 
        (r.location && r.location.toLowerCase().includes(query)) ||
        (r.title && r.title.toLowerCase().includes(query)) ||
        (r.area_name && r.area_name.toLowerCase().includes(query))
      );
    }

    const formatted = results.map(r => ({
      ...r,
      featured: r.featured === 1
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/debug', (req, res) => {
  try {
    const cwd = process.cwd();
    const taskDir = '/var/task';
    res.json({
      cwd,
      __dirname,
      cwdFiles: fs.existsSync(cwd) ? fs.readdirSync(cwd) : 'not found',
      taskFiles: fs.existsSync(taskDir) ? fs.readdirSync(taskDir) : 'not found',
      dirFiles: fs.existsSync(__dirname) ? fs.readdirSync(__dirname) : 'not found',
      csvCheck: filesToProcess.map(f => ({ file: f, path: resolveCSVPath(f) }))
    });
  } catch(err) {
    res.json({ error: err.message });
  }
});

const PORT = process.env.BACKEND_PORT || 5000;

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'dist')));

app.get(/(.*)/, (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.message);
  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Only listen if not running on Vercel
if (!process.env.VERCEL) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Full-stack server running on http://localhost:${PORT}`);
      });
    })
    .catch((error) => {
      console.error('Failed to start server:', error.message);
      process.exit(1);
    });
}

export default app;

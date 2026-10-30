import dotenv from 'dotenv';

// Carrega o .env antes dos demais módulos (alguns leem process.env na importação).
dotenv.config({ quiet: true });

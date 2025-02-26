import dungeonJobService from '../services/dungeonJobService.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('Iniciando serviço de jobs das dungeons...');
dungeonJobService.startJob();
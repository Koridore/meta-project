import Kottu from './src/struct/Kottu';
import config from './src/config';
const clientConfig = config.getParsedConfig();
const kottu = new Kottu(clientConfig);
kottu.initiate();

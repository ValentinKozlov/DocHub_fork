/*
Copyright (C) 2021 owner Roman Piontik R.Piontik@mail.ru

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

In any derivative products, you must retain the information of
owner of the original code and provide clear attribution to the project

        https://dochub.info

The use of this product or its derivatives for any purpose cannot be a secret.

  Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Maintainers:
    R.Piontik <R.Piontik@mail.ru>

Contributors:
    R.Piontik <R.Piontik@mail.ru>
    Nikolay Temnyakov <temnjakovn@gmail.com>
*/


import prototype from '../../global/manifest/services/cache.mjs';
import request from '../helpers/request.mjs';
import logger from '../utils/logger.mjs';
import uriTool from '../helpers/uri.mjs';
import { fileURLToPath } from 'url';
import yaml from 'yaml';
import path from 'path';
import fs from 'fs';
import md5 from 'md5';
import createRedisClient from '../drivers/redis.mjs';

const LOG_TAG = 'manifest-cache';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cacheMode = (process.env.VUE_APP_DOCHUB_DATALAKE_CACHE || 'none').toLocaleLowerCase();

const redisClient = cacheMode === 'redis' ? await createRedisClient() : null;

export function loadFromAssets(filename) {
    const source = path.resolve(__dirname, '../../assets/' + filename);

    logger.log(`Import base metamodel from  [${source}].`, LOG_TAG);
    return fs.readFileSync(source, { encoding: 'utf8', flag: 'r' });
}

// Подключает базовую метамодель
function loadBaseMatamodel() {
    return yaml.parse(loadFromAssets('base.yaml'));
}

// Кэш в памяти
let memoryCache = {};

const errorType = {
    system: 'Внутрисистемная ошибка',
    syntax: 'Синтаксическая ошибка',
    net: 'Сетевая ошибка'
};

export default Object.assign(prototype, {
    // Выполняет resolve URL 
    makeURIByBaseURI: uriTool.makeURIByBaseURI,
    // Содержит ошибки, которые возникли за сессию
    errors: {},
    // Очищает регистр ошибок
    errorClear() {
        this.errors = {};
    },
    // Очистка кэша
    //  prefix - Префикс, который будет использован перед ключом
    async clearCache(prefix) {
      switch (cacheMode) {
        case 'none': return; 
        case 'memory': memoryCache = {}; break;
        case 'redis': 
            if (!redisClient) return;
            try {
            // eslint-disable-next-line no-case-declarations
            const keys = await redisClient.keys(`DocHub.cache.${prefix || ''}.*`);
            keys.map((key) => redisClient.del(key));
            } catch (redisError) {
                logger.error(`Redis clear cache failed: ${redisError.message}`, LOG_TAG);
            }
            break;
        default: {
          const cacheDir = path.resolve(__dirname, '../../../', cacheMode);
          fs.readdir(cacheDir, (err, files) => {
            if (err) throw err;
            for (const file of files) {
              fs.unlink(`${cacheDir}/${file}`, err => logger.error(err, LOG_TAG));
            }
          });
        }
      }
    },
    // Регистрирует ошибку
    // type         - Секция ошибки (system/syntax/net)
    // uid          - Уникальный идентификатор ошибки. 
    // title        - Определяет представление ошибки в дереве.
    // location     - URL с расположением объекта, где выявлена ошибка.
    // correction   - Краткое пояснение, как исправить ошибку.
    // description  - Описание причины ошибки.
    registerError(type, uid, title, location, correction, description) {
        !this.errors[type] && (this.errors[type] = {
            id: `$error.${type}`,
            title: errorType[type] || 'Неизвестная ошибка',
            items: []
        });
        logger.error(`${title}: ${description} [${location}]`, LOG_TAG);
        this.errors[type].items.push({
            uid, title, location, correction, description
        });
    },
    // Получает данные из кэша 
    //  prefix - Префикс, который будет использован перед ключом
    //  key - ключ
    //  resolve - если в кэше данные не будут найдены, будет вызвана функция для генерации данных
    //  res - response объект express. Если указано, то ответ сразу отправляется клиенту
    async pullFromCache(prefix, key, resolve, res) {
        let fileName = null;
        try {
            let result = null;
            const md5Key = `DocHub.cache.${prefix || 'unknown'}.${md5(key)}`;
            
            switch (cacheMode) {
                case 'none': result = resolve && await resolve() || undefined; break;
                case 'memory': result = memoryCache[md5Key] 
                    || (resolve && (memoryCache[md5Key] = await resolve()));
                    break;
                case 'redis': 
                    if (!redisClient) {
                        // Fallback to memory cache if Redis client is not available
                        result = memoryCache[md5Key] 
                            || (resolve && (memoryCache[md5Key] = await resolve()));
                    } else {
                        try {
                            result = await redisClient.get(md5Key);
                            if (result) {
                                result = JSON.parse(result);
                            } else {
                                result = await resolve();
                                
                                // Проверяем, что result не undefined
                                if (result === undefined || result === null) {
                                    return res ? true : result;
                                }
                                
                                let serializedResult;
                                try {
                                    serializedResult = JSON.stringify(result);
                                } catch (jsonError) {
                                    logger.error(`JSON serialization failed: ${jsonError.message}, falling back to memory cache`, LOG_TAG);
                                    memoryCache[md5Key] = result;
                                    return res ? true : result;
                                }
                                // Проверяем размер данных (Redis имеет ограничение ~512MB на значение)
                                if (serializedResult.length > 100 * 1024 * 1024) { // 100MB
                                    memoryCache[md5Key] = result;
                                } else {
                                    await redisClient.set(md5Key, serializedResult);
                                }
                            }
                        } catch (redisError) {
                            // Fallback to memory cache if Redis operation fails
                            logger.error(`Redis operation failed: ${redisError.message}, falling back to memory cache`, LOG_TAG);
                            result = memoryCache[md5Key] 
                                || (resolve && (memoryCache[md5Key] = await resolve()));
                        }
                    }
                    break;
                default: {
                    const hash = md5(key);
                    fileName = path.resolve(__dirname, '../../../', cacheMode, `${hash}.cache`);
                    if (!fs.existsSync(fileName)) {
                        result = JSON.stringify(await resolve() || null);
                        fs.writeFileSync(fileName, result, { encoding: 'utf8' });
                    }
                }
            }

            if (res) {
                if (fileName) {
                    res.setHeader('Content-Type', 'application/json').sendFile(fileName);
                } else res.status(200).json(result);
            } else if (fileName) {
                result = JSON.parse(fs.readFileSync(fileName, { encoding: 'utf8' }));
            }

            return res ? true : result;
        } catch (e) {
            this.registerError('system', md5(key), 'Cache error', fileName || cacheMode, 'See error log at backed server', e.message);
            if (res) {
                res.status(500);
                res.json({
                    message: e.message,
                    error: e
                });
            }
            return undefined;
        }
    },
    // Выполняет запрос к данным
    async request(url, propPath) {
        let result = null;
        // Если это рутовый манифест, формируем его по конфигурации
        if ((url === 'file:///$root$') && (propPath === '/')) {
            // Подключаем базовую метамодель
            const content = loadBaseMatamodel();
            if (!content.imports) content.imports = [];
            
            // Подключаем метамодель DocHub или собственную
            content.imports.push(process.env.VUE_APP_DOCHUB_METAMODEL || '/metamodel/root.yaml');

            // Подключаем документацию, если нужно
            if ((process.env.VUE_APP_DOCHUB_APPEND_DOCHUB_DOCS || 'y').toLowerCase() === 'y') {
                content.imports.push('/documentation/dochub.yaml');
            }

            // Подключаем корневой манифест, если есть
            if (process.env.VUE_APP_DOCHUB_ROOT_MANIFEST) {
                content.imports.push(process.env.VUE_APP_DOCHUB_ROOT_MANIFEST);
            }
            
            logger.log(`Root manifest is [${content.imports.join('], [')}].`, LOG_TAG);
            result = {
                data: content
            };
        } else {
            try {
                result = await request(url);
            } catch(e) {
                this.registerError('net', md5(url), 'Request error', url, 'See details in error log of backed server', e.message);
                throw e;
            }
            logger.log(`Source [${url}] is imported.`, LOG_TAG);
        }
        return result;
    }
});


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

  */

import env from '@front/helpers/env';
import { create } from '../core/store';
import { get, add, put } from '../core/data';

import config from './config.json';
import { TCacheData } from '../types/idb.types';

async function storeName() {
  //const user = await window['OidcUserManager']?.getUser();
  // eslint-disable-next-line no-console
  //console.log(user?.profile?.roles);
  return env.rootManifest || 'dochub';
}

const init = async function(): Promise<IDBObjectStore> {
  const _storeName = await storeName();
  return await create({
    ...config,
    storeName: _storeName,
    version: config['version']
  });
};

const getData = async function(id: string): Promise<TCacheData> {
  const _storeName = await storeName();
  return await get({
    storeName: _storeName,
    dbName: config.dbName,
    indexName: config.indexes[0].name,
    value: id
  });
};

const setData = async function(data: TCacheData): Promise<string | number> {
  const _storeName = await storeName();
  return await add(
    config.dbName,
    _storeName,
    data
  );
};

const putData = async function(data: TCacheData): Promise<string | number> {
  const _storeName = await storeName();
  return await put(
    config.dbName,
    _storeName,
    data
  );
};

export {
  init,
  getData,
  setData,
  putData
};

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
      Vladislav Markin <markinvy@yandex.ru>

  Contributors:
      Vladislav Markin <markinvy@yandex.ru>
  */

export default function(config) {
	this.axiosInterceptor = async(params) => {
		if (config.bitbucket_server && ((new URL(params.url)).host === (new URL(config.bitbucket_server)).host)) {
			params.headers ||= {};
			// eslint-disable-next-line no-undef
			params.headers['Authorization'] = `Bearer ${config.personalToken || Vuex?.state?.access_token}`;
			params.headers['X-Atlassian-Token'] = 'no-check';
		}
		return params;
	};

	this.makeFileURI = (projectID, repositoryId, source, branch) => {
    if (!config.bitbucket_server) throw new Error('Not defined Bitbucket server!');
    if (!projectID || !repositoryId || !source || !branch) throw new Error(`incorrect Bitbucket URI to ${projectID}:${repositoryId}:${branch}@${source}!`);
		const result = new URL(
			`rest/api/1.0/projects/${projectID}/repos/${repositoryId}/raw/`
			+ encodeURIComponent(source).split('%2F').join('/')
			+ `?at=${branch}`
			, config.bitbucket_server);
		return result;
	};
}

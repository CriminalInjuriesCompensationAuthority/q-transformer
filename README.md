# `q-transformer`
[![GitHub repo size](https://img.shields.io/github/repo-size/CriminalInjuriesCompensationAuthority/q-transformer)](https://github.com/CriminalInjuriesCompensationAuthority/q-transformer)
[![GitHub repo version](https://img.shields.io/github/package-json/v/CriminalInjuriesCompensationAuthority/q-transformer)](https://github.com/CriminalInjuriesCompensationAuthority/q-transformer/releases/latest)
[![GitHub repo npm version](https://img.shields.io/badge/npm_version->=8.5.2-blue)](https://github.com/CriminalInjuriesCompensationAuthority/q-transformer/blob/master/package.json#L7)
[![GitHub repo node version](https://img.shields.io/badge/node_version->=16.0.0-blue)](https://github.com/CriminalInjuriesCompensationAuthority/q-transformer/blob/master/package.json#L8)
[![GitHub repo contributors](https://img.shields.io/github/contributors/CriminalInjuriesCompensationAuthority/q-transformer)](https://github.com/CriminalInjuriesCompensationAuthority/q-transformer/graphs/contributors)
[![GitHub repo license](https://img.shields.io/github/package-json/license/CriminalInjuriesCompensationAuthority/q-transformer)](https://github.com/CriminalInjuriesCompensationAuthority/q-transformer/blob/master/LICENSE)


The `q-transformer` module takes a JSON Schema Object and tranforms it in to a renderable Nunjucks string. `q-transformer` is a dependency of the [Cica Web](https://github.com/CriminalInjuriesCompensationAuthority/cica-web) front-facing web app. 

## Prerequisites
* Windows machine running docker desktop.
* You have Node Version Manager (NVM) installed globally. <sup>(_recommended, not required_)</sup>
* You have NPM `">=8.5.2"` installed globally.
* You have Node `">=16.0.0"` installed globally.
* You have the Postgres `create-tables.sql` file in a sibling directory named `postgres-scripts` (this mapping is defined in the `docker-compose.yml` file)

## Installing `q-transformer`

Clone the `q-transformer` repo, and `npm install`. This is not required to run the web app, this step would be carried out if you were doing development work and updating the transformer.

## Using `q-transformer`
`q-transformer` is a dependency of [Cica Web](https://github.com/CriminalInjuriesCompensationAuthority/cica-web) and it will be installed and used at run time by Cica Web.

If you are modifying the `q-transformer`, it should be mounted via the `docker-compose.yml`. After mounting, you should `down`, `build`, and `up` to create a clean set up.

> Full instructions on the required directory structure and configuration is found in the `Docker-compose-setup-for-CW,-DCS,-Postgres` Utilities Wiki article <sup>(_private repo_)</sup>.

## Contributors
Thanks to the following people who have contributed to this project:
* [@armoj](https://github.com/armoj)
* [@neil-stephen-mcgonigle](https://github.com/neil-stephen-mcgonigle)
* [@BarryPiccinni](https://github.com/BarryPiccinni)
* [@sinclairs](https://github.com/sinclairs)
* [@stephenjmcneill1971](https://github.com/stephenjmcneill1971)
* [@tjbburton](https://github.com/tjbburton)


## License
This project uses the following license: MIT.

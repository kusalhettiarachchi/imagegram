# imagegram
a system which allows you to add posts and comment on them while filtering offensive content uploaded by the users

## How to run
1. clone
2. run `npm install`
3. if you would like to reset the database, run `npm run migration`
4. copy the `.env-sample` file to `.env` file
5. update the parameters `SERVICE_URL` and `FUNCTION_KEY`
6. update the offensive parameters as necessary (more at: [here](https://sightengine.com/docs/models))
7. run `npm run start`

## How to run with Docker (not tested)
8. run `build.sh`

## Notes
9. refer to the Postman collection under the directory `api/postman`
10. and the OpenAPI specification in the directory `spec`

## Known issues
11. Azure function seems to randomly rotate the `FUNCTION_KEY` and `SERVICE_URL` parameters. In that case the images will not be analysed and the system will log a 401 error at the processing step. Please contact the [developer](mailto:kusalhettiarachchi@hotmail.com)

// APP entry point.
import { Request, Response } from 'express'
import getServer from './server'
import buildGraphQLRouteHandler from './graphql'
import {getConnection} from './models'
import {Connection} from 'typeorm'
import {graphiqlExpress } from 'graphql-server-express';

export default async function startServer (
	{isDev = false, isTest = false}, dbConnection?: Connection
) {
	const connection = dbConnection || await getConnection()
	const app = await getServer(connection, isDev)

	// Adds Enviornment variables from .enviornment
	const env = (isDev && 'development') || (isTest && 'test') || 'production'

	function authenticatedOnly (request: Request, response: Response, next: Function) {
		if (!request.user) {
			console.log('no user', request.user)

			response.status(403);
			return response.send()
		} else {
			return next()
		}
	}

	app.use('/graphql', buildGraphQLRouteHandler());
	app.use('/graphiql', graphiqlExpress({endpointURL: '/graphql'}))

	return app
}

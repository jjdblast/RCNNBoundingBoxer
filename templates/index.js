import views from 'co-views'
import { createLogger } from '../server/logger'
var logger = createLogger('templates')

var render = views('./views', {
    map: { html: 'mustache' }
})

/**
 * If you add a body in a handler like :
 *
 *    {
 *       view: 'home',
 *       data: { title: 'some title here'} // data is optional
 *    }
 *
 * This middleware will render the requested view with the supplied data
 *
 * @param ctx
 * @param next
 */
export default async (ctx, next) => {

    logger.debug('hitting the rendering middleware')

    try {
        await next()

        logger.debug('now we will check if we need to render a template...')

        if (ctx.body && ctx.body.view){
            logger.debug('...we will render template : ', ctx.body.view)
            // reset the content-type header so the browser won't be expecting JSON
            ctx.response.header['content-type'] = null

            // now fetch the data and set the body
            var content = await render(ctx.body.view, ctx.body.data || {})
            ctx.body = await render('main', { content: content })
        } else {
            logger.debug('...no template render required')
        }

        next()
    }
    catch (err){
        logger.error(err)
        ctx.body = err
        ctx.status = 500
    }
}
import * as bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express, { NextFunction, Request, Response, Router } from 'express';
import createError from 'http-errors';
import logger from 'morgan';
import { debug } from './utils/debug';
import { parseXML } from './utils/xml-parser';

export interface Options {
    templateDir: string;
}

export interface Output {
    app: express.Express;
    router: express.Router;
}

export function createApp({ templateDir }: Options): Output {
    // var indexRouter = require('./routes/index');
    // var usersRouter = require('./routes/users');

    const app: express.Express = express();

    // view engine setup
    // tslint:disable-next-line: no-console
    debug(`Template dir: ${templateDir}`);
    app.set('views', templateDir);
    app.set('view engine', 'ejs');
    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());

    const router = Router();

    router.use(bodyParser.text({
        type: '*/xml',
    }));

    router.use((req: Request, resp: Response, next: NextFunction) => {
        const contentType: string = req.headers['content-type'] || '';

        if (contentType.match(/\/xml$/)) {
            resp.locals.xmlJson = parseXML({
                attrNodeName: false,
                ignoreNameSpace: true,
            }, req.body);
        }
        next();
    });

    app.use('/', router);
    // catch 404 and forward to error handler
    app.use((req: Request, res: Response, next: NextFunction) => {
        next(createError(404));
    });

    // error handler
    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error');
    });

    return {
        app,
        router,
    };
}

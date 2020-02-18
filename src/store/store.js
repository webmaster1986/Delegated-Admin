import rootSaga from './rootSaga';
import reducers from '../reducers';
import createSagaMiddleware from 'redux-saga';
import { createStore, compose, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import logger from 'redux-logger';

const sagaMiddleware = createSagaMiddleware();

let middlewares = applyMiddleware(sagaMiddleware);
let logmiddlewares = applyMiddleware(logger);

const store = createStore(
    reducers,
    compose(middlewares)
);

sagaMiddleware.run(rootSaga);

export default store;


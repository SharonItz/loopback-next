import {Client, expect} from '@loopback/testlab';
import {setupExpressApplication} from './test-helper';
import {ExpressServer} from '../../server';

describe('ExpressApplication', () => {
  let server: ExpressServer;
  let client: Client;

  before('setupApplication', async () => {
    ({server, client} = await setupExpressApplication());
  });

  after('closes application', async () => {
    await server.stop();
  });

  it('displays front page', async () => {
    await client
      .get('/')
      .expect(200)
      .expect('Content-Type', /text\/html/);
  });

  it('displays a static page', async () => {
    await client
      .get('/notes')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect(/<h2>Notes/);
  });

  it('gets hello world', async () => {
    const response = await client.get('/hello').expect(200);
    expect(response.text).to.containDeep('Hello world!');
  });

  it('displays explorer page', async () => {
    // /api/explorer will redirect to /explorer/
    await client.get('/api/explorer').then(res => {
      expect(res.header.location).to.equal('/explorer/');
      client
        .get('/explorer/')
        .expect(200)
        .expect('Content-Type', /text\/html/)
        .expect(/<title>LoopBack API Explorer/);
    });
  });
});

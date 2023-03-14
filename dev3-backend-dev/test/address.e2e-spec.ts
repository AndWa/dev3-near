import { Test } from '@nestjs/testing';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  mockAddresses,
  mockAuthUser,
  mockCreateAddressDto1,
} from './mock-tests-data';
import { AddressModule } from '../src/modules/address/address.module';
import { JwtAuthGuard } from '../src/modules/auth/common/jwt-auth.guard';
import { ServiceResult } from '../src/helpers/response/result';
import { Address } from '../src/modules/address/entities/address.entity';
import { AddressService } from '../src/modules/address/address.service';

describe('AddressController (e2e)', () => {
  let app: INestApplication;
  const phone = '+38599345684';
  const email = 'alice@email.com';
  const updateAddress = { ...mockAddresses[0] };
  updateAddress.phone = phone;
  updateAddress.email = email;
  const addressService = {
    create: () => new ServiceResult<Address>(mockAddresses[0]),
    findAll: () => new ServiceResult<Address[]>(mockAddresses),
    findOne: () => new ServiceResult<Address>(mockAddresses[0]),
    update: () => new ServiceResult<Address>(updateAddress),
    remove: () => new ServiceResult<Address>(updateAddress),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AddressModule],
    })
      .overrideProvider(AddressService)
      .useValue(addressService)
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = mockAuthUser;
          return true;
        },
      })

      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/address (POST) create', async () => {
    const response = await request(app.getHttpServer())
      .post('/address')
      .send(mockCreateAddressDto1);
    expect(response.status).toEqual(200);
    expect(response.body._id).toEqual(
      addressService.create().data._id.toString(),
    );
  });

  it('/address (GET) all addresses', async () => {
    const response = await request(app.getHttpServer()).get('/address');
    expect(response.status).toEqual(200);
    expect(response.body.length).toEqual(addressService.findAll().data.length);
  });

  it('/address (GET) one', async () => {
    const id = '634ff1e4bb85ed5475a1ff5d';
    const response = await request(app.getHttpServer()).get(`/address/${id}`);
    expect(response.status).toEqual(200);
    expect(response.body._id).toEqual(id);
  });

  it('/address (PUT) one', async () => {
    const id = '634ff1e4bb85ed5475a1ff5d';
    const response = await request(app.getHttpServer())
      .patch(`/address/${id}`)
      .send({ phone: phone, email: email });
    expect(response.status).toEqual(200);
    expect(response.body.phone).toEqual(addressService.remove().data.phone);
    expect(response.body.email).toEqual(addressService.remove().data.email);
  });

  it('/address (DELETE) one', async () => {
    const id = '634ff1e4bb85ed5475a1ff5d';
    const response = await request(app.getHttpServer()).delete(
      `/address/${id}`,
    );
    expect(response.status).toEqual(200);
    expect(response.body._id).toEqual(
      addressService.remove().data._id.toString(),
    );
  });
});

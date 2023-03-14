import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import {
  mockAddresses,
  mockCreateAddressDto1,
  mockCreateAddressDtos,
  mockUser,
} from '../../../test/mock-tests-data';
import { ServiceResult } from '../../helpers/response/result';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import { Address } from './entities/address.entity';
import { BadRequest, NotFound } from '../../helpers/response/errors';
import { PaginatedDto } from '../../common/pagination/paginated-dto';

describe('AddressController', () => {
  let addressController: AddressController;
  let addressService: AddressService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressController,
        AddressService,
        { provide: getModelToken(Address.name), useValue: jest.fn() },
      ],
    }).compile();

    addressService = module.get<AddressService>(AddressService);
    addressController = module.get<AddressController>(AddressController);
  });

  describe('findAll', () => {
    it('should return all addresses', async () => {
      const result = new ServiceResult<PaginatedDto<Address>>({
        total: 4,
        count: 4,
        limit: 0,
        offset: 0,
        results: mockAddresses,
      });
      jest.spyOn(addressService, 'findAll').mockResolvedValue(result);
      const req: any = {
        user: mockUser,
      };
      const response = await addressController.findAll(req);
      expect(response).toBe(result.data);
    });
  });

  describe('findOne', () => {
    it('should return one address', async () => {
      const result = new ServiceResult<Address>(mockAddresses[0]);
      jest.spyOn(addressService, 'findOne').mockResolvedValue(result);
      const req: any = {
        user: mockUser,
      };
      const response = await addressController.findOne(
        req,
        '634ff1e4bb85ed5475a1ff6d',
      );
      expect(response).toBe(result.data);
    });

    it('should return Address not found (Not Found - 404) exception', async () => {
      const result = new NotFound<Address>('Address not found');
      jest.spyOn(addressService, 'findOne').mockResolvedValue(result);
      const req: any = {
        user: mockUser,
      };
      try {
        await addressController.findOne(req, '634ff1e4bb85ed5475a1ff65');
      } catch (error) {
        expect(error.status).toBe(404);
        expect(error.message).toBe('Address not found');
      }
    });
  });

  describe('create', () => {
    it('should create one address', async () => {
      const result = new ServiceResult<Address>(mockAddresses[0]);
      jest.spyOn(addressService, 'create').mockResolvedValue(result);
      const req: any = {
        user: mockUser,
      };
      const response = await addressController.create(
        req,
        mockCreateAddressDto1,
      );
      expect(response).toBe(result.data);
    });

    it('should return wallet must be named or implicit near wallet (Bad request - 400) exception', async () => {
      const wallet = 'test.hear';
      const dto = { ...mockCreateAddressDtos[0] };
      dto.wallet = wallet;
      const result = new BadRequest<Address>(
        'wallet must be named or implicit near wallet',
      );

      jest.spyOn(addressService, 'create').mockResolvedValue(result);
      const req: any = {
        user: mockUser,
      };
      try {
        await addressController.create(req, dto);
      } catch (error) {
        expect(error.status).toBe(400);
        expect(error.message).toBe(
          `wallet must be named or implicit near wallet`,
        );
      }
    });

    it('should return alias should not be empty (Bad request - 400) exception', async () => {
      const dto = { ...mockCreateAddressDtos[0] };
      dto.alias = undefined;
      const result = new BadRequest<Address>('alias should not be empty');
      jest.spyOn(addressService, 'create').mockResolvedValue(result);
      const req: any = {
        user: mockUser,
      };
      try {
        await addressController.create(req, dto);
      } catch (error) {
        expect(error.status).toBe(400);
        expect(error.message).toBe('alias should not be empty');
      }
    });
  });

  describe('update', () => {
    it('should update one address', async () => {
      const phone = '+38599345684';
      const email = 'alice@email.com';
      const address = { ...mockAddresses[0] };
      address.phone = phone;
      address.email = email;

      const result = new ServiceResult<Address>(address);
      jest.spyOn(addressService, 'update').mockResolvedValue(result);
      const req: any = {
        user: mockUser,
      };
      const response = await addressController.update(
        req,
        address._id.toString(),
        { phone: phone, email: email },
      );
      expect(response.email).toBe(email);
      expect(response.phone).toBe(phone);
    });

    it('should return phone must be a valid phone number (Bad request - 400) exception', async () => {
      const phone = '+385993456';
      const email = 'alice@email.com';
      const address = { ...mockAddresses[0] };
      address.phone = phone;
      address.email = email;

      const result = new BadRequest<Address>(
        'phone must be a valid phone number',
      );

      jest.spyOn(addressService, 'update').mockResolvedValue(result);
      const req: any = {
        user: mockUser,
      };

      try {
        await addressController.update(req, address._id.toString(), {
          phone: phone,
          email: email,
        });
      } catch (error) {
        expect(error.status).toBe(400);
        expect(error.message).toBe(`phone must be a valid phone number`);
      }
    });

    it('should return email must be an email (Bad request - 400) exception', async () => {
      const phone = '+38599345684';
      const email = 'alice';
      const address = { ...mockAddresses[0] };
      address.phone = phone;
      address.email = email;

      const result = new BadRequest<Address>('email must be an email');
      jest.spyOn(addressService, 'update').mockResolvedValue(result);
      const req: any = {
        user: mockUser,
      };

      try {
        await addressController.update(req, address._id.toString(), {
          phone: phone,
          email: email,
        });
      } catch (error) {
        expect(error.status).toBe(400);
        expect(error.message).toBe(`email must be an email`);
      }
    });
  });

  describe('delete', () => {
    it('should delete one address', async () => {
      const result = new ServiceResult<Address>(mockAddresses[0]);
      jest.spyOn(addressService, 'remove').mockResolvedValue(result);
      const req: any = {
        user: mockUser,
      };

      const response = await addressController.remove(
        req,
        mockAddresses[0]._id.toString(),
      );
      expect(response._id.toString()).toBe(mockAddresses[0]._id.toString());
    });

    it('should return Address not found (Not found - 404) exception', async () => {
      const result = new NotFound<Address>('Address not found');
      jest.spyOn(addressService, 'remove').mockResolvedValue(result);
      const req: any = {
        user: mockUser,
      };
      try {
        await addressController.remove(req, mockAddresses[0]._id.toString());
      } catch (error) {
        expect(error.status).toBe(404);
        expect(error.message).toBe(`Address not found`);
      }
    });
  });
});

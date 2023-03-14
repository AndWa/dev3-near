import { Role } from '../../../common/enums/role.enum';

export class CreateUserDto {
  uid: string;
  accountType: string;
  username: string;
  nearWalletAccountId: string;
  roles: Role[];
}

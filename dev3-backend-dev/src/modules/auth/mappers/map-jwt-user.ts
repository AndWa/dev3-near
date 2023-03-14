import { User } from '../../user/entities/user.entity';
import { JwtUser } from '../dto/jwt-user';

export const mapJwtUser = (user: User): JwtUser => {
  return {
    uid: user.uid,
    username: user.username,
    accountType: user.accountType,
    roles: user.roles,
  };
};

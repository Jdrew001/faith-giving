import { UserService } from '@faith-giving/faith-giving.service';
import { Injectable} from '@nestjs/common';

@Injectable()
export class AppService {

  constructor(
    private userService: UserService
  ) {}

  getData() {
    let admins = this.userService.findAdmins();
    return { admins: admins };
  }
}

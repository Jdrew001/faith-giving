import moment from 'moment';


export class FollowUpModel {
    ActionId: number = 338090;
    Date: string;
    FollowTypeId: 3;
    FollowerIds: Array<number> = [2279567];
    Id: number = 0;
    IsDone: boolean = false;
    MemberId: number = 0; //unsure
    Notes: string;
    selectedMembers: Array<any> = [];
    SelectedMemberIds: Array<number> = [];
    StartTime: string = moment().startOf('day').add(8, 'hours').format('YYYY-MM-DDTHH:mm:ss');
    EndTime: string = moment().startOf('day').add(21, 'hours').format('YYYY-MM-DDTHH:mm:ss');;
    FrequencyType: number = 0;
    IsRecurring: boolean = false;
    WeeklyRecurring = null;
    MonthlyRecurring = null;
    RecurringFollowUpId: number = 0;
    DoneOn = null; 

    constructor(members: Array<number>) {
        this.SelectedMemberIds = members;
    }
}
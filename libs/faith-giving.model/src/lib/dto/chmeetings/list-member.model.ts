export class ListMemberRequest {
    UsersSearchType: number = 1;
    AdvancedSearchUserStatus: number = 0;
    Gender: number[] = [0]
    FamilySearchType: number = 0;
    MainChurchOption: number
    MemberPhotoSearchType: number
    SocialStatus: number
    MemberTextStatus: number
    MobileNumberValidation: number
    MemberEmailType: any
    MemberDirectoryStatus: number
    OnlyExistInTheSelectedGroup: boolean
    MarriageDateTo: any
    MarriageDateFrom: any
    MarriageTo: any
    MarriageFrom: any
    UserRolesIds: any[] = []
    CreatedSinceDays: number = 2;
    CreationDateFrom: any
    CreationDateTo: any
    MinistrySearchType: number
    Ministries: any[] = []
    OnlyExistInTheSelectedMinistries: boolean
    GroupSearchType: number = 0;
    DidntAttendSince: any
    AttendAtLeastOnceSince: any
    DidntBookSince: any
    BookAtLeastOnceSince: any
    CalendarsForEventsAttendance: any[] = []
    ConfessionMoreThan: any
    ConfessAtLeastOnceSince: any
    NextConfessionDateFrom: any
    NextConfessionDateTo: any
    BirthdateFrom: any
    BirthdateTo: any
    AgeFrom: any
    AgeTo: any
    LastModifiedDateFrom: any
    LastModifiedDateTo: any
    LastModifiedSinceDays: any
    JoinDateFrom: any
    JoinDateTo: any
    CountryId: number = 0;
    CityId: number = 0;
    AreaId: number = 0;
    AddressLine: string
    DidntFollowedUpSince: any
    NotAssignedFollowedUpFrom: any
    NotAssignedFollowedUpTo: any
    SpiritualInfoChurchId: any
    SpiritualInfoChurchName: string
    SpiritualInfoFatherName: string
    MemberEducationTypeInfoId: any
    MemberEducationTypeInfoName: string
    MemberEducationPlaceInfoId: any
    MemberEducationPlaceInfoName: string
    MemberEducationQualificationInfoId: any
    MemberEducationQualificationInfoName: string
    WorkInfoJobId: any
    WorkInfoJobName: string
    WorkPlace: string
    TalentsAndHobbies: string
    GradeValues: any[] = []
    GraduationYearFrom: any
    GraduationYearTo: any
    Notes: string
    FamilyRoles: any[] = []
    BaptismLocation: string
    BaptismDateFrom: any
    BaptismDateTo: any
    DeaconRank: any
    CustomFieldTexts: any[] = []
    CustomFieldNumbers: any[] = []
    CustomFieldDates: any[] = []
    CustomFieldAttachments: any[] = []
    CustomFieldLists: any[] = []
    MissingDataList: any[] = []
    Telephone: any
    InvitationType: number = 0;
    LogFilterEnabled: boolean
    IsAdvancedSearch: boolean = true;
    SelectAll: boolean
    OperationType: number
    PageSize: number = 200;
    Page: number = 1;
}

interface IPagination {
  page?: number;
  limit?: number;
}

interface IFilter {
  tags?: string[];
}

export default interface IFindList {
  isAuth: boolean;
  pagination?: IPagination;
  filter?: IFilter;
}

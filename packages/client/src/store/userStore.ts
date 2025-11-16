import type { User } from "@/types/user";
import { getMembersDetails } from "@/utils/api/community";
import { makeAutoObservable, runInAction } from "mobx";

class UserStore {
  communityUsers = new Map<string, Map<string, User & { loading?: boolean }>>();

  constructor() {
    makeAutoObservable(this);
  }

  getUsersByCommunityName(communityName: string) {
    return this.communityUsers.get(communityName) || new Map();
  }

  getUser(communityName: string, userId: string) {
    return this.getUsersByCommunityName(communityName).get(userId);
  }

  async getUsersBulk(communityName: string, userIds: string[]) {
    const users = this.getUsersByCommunityName(communityName);
    const filter = userIds.filter((id) => !users.has(id));
    if (!filter.length) return;
    runInAction(() => {
      filter.forEach((userId) => {
        this.setUserLoading(communityName, userId, true);
      });
    });

    const bulk = await getMembersDetails(communityName, filter);
    runInAction(() => {
      bulk.data.users.forEach((user: User) => {
        this.setUser(communityName, user);
      });
    });
    return filter;
  }

  setUser(communityName: string, user: User) {
    if (!this.communityUsers.has(communityName)) {
      this.communityUsers.set(communityName, new Map());
    }
    this.communityUsers
      .get(communityName)!
      .set(user.id, { ...user, loading: false });
  }

  setUserLoading(communityName: string, userId: string, loading: boolean) {
    if (!this.communityUsers.has(communityName)) {
      this.communityUsers.set(communityName, new Map());
    }
    const users = this.communityUsers.get(communityName)!;
    const existingUser = users.get(userId);
    if (existingUser) users.set(userId, { ...existingUser, loading });
    else
      users.set(userId, { id: userId, loading } as User & { loading: boolean });
  }

  removeUserFromCommunity(communityName: string, userId: string) {
    this.communityUsers.get(communityName)?.delete(userId);
  }
}
export const userStore = new UserStore();

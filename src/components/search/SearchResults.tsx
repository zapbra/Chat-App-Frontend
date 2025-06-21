import SearchResult from "./SearchResult";

import { SearchUser } from "../../types";

export default function SearchResults({
    search,
    users,
}: {
    search: string;
    users: SearchUser[];
}) {
    console.log("users??");
    console.log(users);
    return (
        <div className="shadow">
            {users.map((user) => {
                return (
                    <SearchResult
                        id={user.id}
                        username={user.username}
                        search={search}
                    />
                );
            })}
        </div>
    );
}

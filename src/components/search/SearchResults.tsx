import SearchResult from "./SearchResult";

import { SearchUser } from "../../types";

export default function SearchResults({
    search,
    users,
    hideResults,
}: {
    search: string;
    users: SearchUser[];
    hideResults: () => void;
}) {
    return (
        <div className="shadow">
            {users.map((user) => {
                return (
                    <SearchResult
                        key={user.id}
                        id={user.id}
                        username={user.username}
                        search={search}
                        hideResults={hideResults}
                    />
                );
            })}
        </div>
    );
}

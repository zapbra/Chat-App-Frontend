import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import SearchResults from "./SearchResults";
import { SearchUser } from "../../types";

const URL = import.meta.env.VITE_API_BASE_URL;

export default function SearchBar() {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
    const [isResultsVisible, setIsResultsVisible] = useState(false);
    const searchResultsRef = useRef<HTMLDivElement>(null);

    // Causes the search to trigger 300 milliseconds after search last keystroke
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);

        return () => {
            clearTimeout(timer); // clears on every keystroke
        };
    }, [search]);

    useEffect(() => {
        if (!debouncedSearch) {
            setSearchResults([]);
            return;
        }
        // Fetch user list based on search
        const fetchData = async () => {
            try {
                const response = await fetch(`${URL}/search`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ search: debouncedSearch }),
                });
                const data = await response.json();
                setSearchResults(data.users);
                setIsResultsVisible(true);
            } catch (error) {
                console.log(error);
            }
        };

        fetchData();
    }, [debouncedSearch]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = e.target.value;
        setSearch(searchValue);
    };

    // Handle clicks outside of the search results to hide the results
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                searchResultsRef.current &&
                !searchResultsRef.current.contains(event.target as Node)
            ) {
                setIsResultsVisible(false);
            } else if (
                searchResultsRef.current &&
                searchResultsRef.current.contains(event.target as Node)
            ) {
                setIsResultsVisible(true);
            }
        }

        window.addEventListener("click", handleClickOutside);

        return () => {
            window.removeEventListener("click", handleClickOutside);
        };
    }, []);

    const hideResults = () => {
        setIsResultsVisible(false);
    };
    return (
        <div
            ref={searchResultsRef}
            className="relative bg-sky-100 transition focus-within:bg-white rounded-lg px-2 py-2 flex gap-2 max-w-[400px] w-full"
        >
            <Search />
            <input
                type="text"
                className="w-full"
                value={search}
                onChange={handleChange}
            />
            {isResultsVisible && (
                <div className="absolute top-[100%] left-0 w-full ">
                    <SearchResults
                        search={debouncedSearch}
                        users={searchResults}
                        hideResults={hideResults}
                    />
                </div>
            )}
        </div>
    );
}

import { expect, test } from "vitest";
import { sortReactions } from "../services/messages";

const testReactions = [
    { username: "alice", emoji: "😂" },
    { username: "bob", emoji: "😂" },
    { username: "carol", emoji: "🔥" },
    { username: "dave", emoji: "❤️" },
    { username: "eve", emoji: "😂" },
    { username: "frank", emoji: "👍" },
    { username: "grace", emoji: "🔥" },
    { username: "heidi", emoji: "❤️" },
    { username: "ivan", emoji: "😈" },
    { username: "judy", emoji: "😂" },
    { username: "mallory", emoji: "😎" },
    { username: "trent", emoji: "🔥" },
];

const expectedReactionsResult = {
    "😂": ["alice", "bob", "eve", "judy"],
    "🔥": ["carol", "grace", "trent"],
};

test("sortReactions() returns properly sorted reactions", () => {
    const reactions = sortReactions(testReactions, "alice");

    const areEqual =
        reactions["😂"].users.length === expectedReactionsResult["😂"].length &&
        reactions["😂"].users.every(
            (val, i) => val === expectedReactionsResult["😂"][i]
        );

    expect(areEqual).toBe(true);
    expect(reactions["😂"].userReacted).toBe(true);
    expect(reactions["🔥"].userReacted).toBe(false);
});

import React, { useState, useEffect } from "react";

function App() {
  const [userData, setUserData] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    if (search.trim() === "") {
      setUserData(null);
      return;
    }

    fetch(`https://dummyjson.com/users/search?q=${search}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch");
        }
        return response.json();
      })
      .then((data) => {
        setUserData(data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setUserData(null);
      });
  }, [search]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="flex flex-col gap-5 w-full max-w-2xs">
        <div className="bg-white p-4 rounded-2xl shadow-md flex flex-col transition-shadow hover:border-blue-500 hover:border">
          <div className="mb-4 flex flex-row flex-wrap gap-4">
            {selectedUsers.length > 0 &&
              selectedUsers.map((user) => (
                <div
                  key={user.id}
                  className="mb-2 rounded-xl bg-gradient-to-r flex flex-row gap-2 from-indigo-600 to-violet-600 opacity-70 p-2 shadow text-white"
                >
                  <div>
                    <img src={user.image} alt="" className="h-5 w-5" />
                    {user.firstName} {user.lastName}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedUsers(
                        selectedUsers.filter((u) => u.id !== user.id)
                      );
                    }}
                  >
                    X
                  </button>
                </div>
              ))}
          </div>

          <input
            type="text"
            placeholder="Search users..."
            className="rounded p-2 border border-gray-300 outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={(e) => setSearch(e.target.value)}
            value={search}
          />
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-md flex flex-col transition-shadow hover:border-blue-500 hover:border">
          {userData?.users?.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {userData.users.map((user) => (
                <div
                  key={user.id}
                  className="cursor-pointer rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 opacity-70 p-2 shadow text-white"
                  onClick={() => {
                    if (!selectedUsers.some((u) => u.id === user.id)) {
                      setSelectedUsers([...selectedUsers, user]);
                    }
                  }}
                >
                  <h2 className="text-lg text-center font-bold">
                    {user.firstName} {user.lastName}
                  </h2>
                </div>
              ))}
            </div>
          ) : search ? (
            <p className="text-gray-500">No users found.</p>
          ) : (
            <p className="text-gray-500">Start typing to search users.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

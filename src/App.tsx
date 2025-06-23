import { useState, useEffect } from 'react';
import './App.css';
import TwitchChat from './TwitchChat';
import SpinnerWheel from './SpinnerWheel';

function App() {
  const [locked, setLocked] = useState(false);
  const [users, setUsers] = useState<string[]>([]);

  const removeUser = (name: string) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user !== name));
  };

  const addUser = (name: string) => {
    if (locked) return;
    
    const trimmedName = name.trim();
    if (!trimmedName) return;
    
    setUsers((prevUsers) => {
      if (prevUsers.includes(trimmedName)) {
        return prevUsers;
      }
      return [...prevUsers, trimmedName];
    });
  };

  const toggleLock = () => {
    setLocked(!locked);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Chat component - floating in top left with better positioning */}
      <div className="fixed top-6 left-6 z-10 max-md:relative max-md:top-0 max-md:left-0 max-md:mb-4">
        <TwitchChat
          isLocked={locked}
          channel="andullie"
          onJoin={(name) => addUser(name)}
        />
      </div>

      {/* Main content area */}
      <div className="flex h-screen gap-8 max-md:flex-col max-md:h-auto max-md:gap-4">
        {/* Left side - Spinner wheel with maximum space utilization */}
        <div className="flex-1 flex flex-col items-center justify-center min-w-0 p-4 pt-20 pb-8 max-md:pt-4 max-md:pb-4">
          <div className="mb-6 flex flex-col items-center">
            <button
              onClick={toggleLock}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
                locked
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {locked ? '🔒 Locked' : '🔓 Unlocked'}
            </button>
            <p className="text-sm text-gray-300 mt-3 text-center max-w-xs">
              {locked ? 'Users cannot join automatically from chat' : 'Users can join automatically from chat'}
            </p>
          </div>
          <div className="flex-1 flex items-center justify-center w-full">
            <SpinnerWheel items={users} remove={removeUser} />
          </div>
        </div>

        {/* Right side - User list that fills available height */}
        <div className="w-96 flex flex-col max-md:w-full p-4 pr-6 max-md:p-4">
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-gray-700/50 flex flex-col h-full min-h-[500px]">
            <h2 className="text-2xl font-bold text-purple-400 mb-6 flex items-center gap-3">
              <span className="text-2xl">👥</span>
              <span>Users ({users.length})</span>
            </h2>
            
            {users.length === 0 ? (
              <div className="text-center text-gray-400 flex flex-col items-center justify-center flex-1">
                <div className="text-6xl mb-6">🎯</div>
                <p className="text-xl mb-2">No users yet</p>
                <p className="text-sm text-gray-500">Users will appear here when they join from chat</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="space-y-3">
                  {users.map((user, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-700/50 rounded-xl p-4 hover:bg-gray-700/70 transition-all duration-200 group"
                    >
                      <span className="font-medium text-white truncate flex-1 text-lg">
                        {user}
                      </span>
                      <button
                        onClick={() => removeUser(user)}
                        className="ml-4 p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-full transition-all duration-200 opacity-70 group-hover:opacity-100"
                        title="Remove user"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

import { useState, useEffect } from 'react';
import './App.css';
import TwitchChat from './TwitchChat';
import SpinnerWheel from './SpinnerWheel';

function App() {
  const [locked, setLocked] = useState(false);
  const [input, setInput] = useState('');
  const [users, setUsers] = useState<string[]>([]);

  // Parse input lines in real-time
  useEffect(() => {
    const lines = input
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '');

    const uniqueLines = [...new Set(lines)];
    setUsers(uniqueLines);
  }, [input]);

  const removeUser = (name: string) => {
    setInput((prevInput) => {
      if (!prevInput) return prevInput; // no input, nothing to remove

      const trimmedName = name.trim();
      const items = prevInput
        .split('\n')
        .map((item) => item.trim())
        .filter((item) => item !== trimmedName); // remove the name

      return items.join('\n'); // join remaining names
    });
  };

  const deduplicatedInsert = (name: string) => {
    setInput((prevInput) => {
      const trimmedName = name.trim();
      if (!prevInput) return trimmedName;
      const items = prevInput.split('\n').map((item) => item.trim());
      if (items.includes(trimmedName)) {
        return prevInput;
      }

      return prevInput + '\n' + trimmedName;
    });
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-black">
        <SpinnerWheel items={users} remove={(name) => removeUser(name)} />
        <textarea
          value={input}
          disabled={locked}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter each spinner item on a new line"
          className="w-full h-32 p-3 rounded bg-gray-800 border border-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <TwitchChat
          isLocked={false}
          channel="andullie"
          onJoin={(name) => deduplicatedInsert(name)}
        />
      </div>
    </>
  );
}

export default App;

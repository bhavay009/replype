import React from 'react';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-50">
      <header className="py-6 px-8 border-b border-slate-700 bg-slate-800">
        <h1 className="text-2xl font-bold text-blue-400">ReplyPe</h1>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold mb-4">Welcome to ReplyPe</h2>
          <p className="text-lg text-slate-400">AI-powered review automation platform</p>
        </div>
      </main>
    </div>
  );
}

export default App;

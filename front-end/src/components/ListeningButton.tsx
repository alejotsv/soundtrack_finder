const ListeningButton: React.FC = () => {
  const handleListen = () => {
    console.log("🎤 Listening...");
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <button
        onClick={handleListen}
        className="w-24 h-24 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 active:scale-90 transition-all"
      >
        🎵
      </button>
    </div>
  );
};

export default ListeningButton;

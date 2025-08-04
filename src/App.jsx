import SnakeLoader from './SnakeLoader';

function App() {
  return (
    <SnakeLoader
      text="Loading..."
      duration={15000}
      onComplete={() => console.log('Done')}
    />
  );
}

export default App;

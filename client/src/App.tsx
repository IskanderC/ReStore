const products = [
  {name: 'product1', price: 100.20},
  {name: 'product2', price: 100.20},
  {name: 'product2', price: 100.20}
  
]

function App() {
  return (
    <div className='app'>
      <h1>Re-Store</h1>
      <ul>
        {products.map((item, index) => (
          <li key={index}>{item.name} - {item.price}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;

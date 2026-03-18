((f) => f(f))(
  (self) => {
    // your logic here
    console.log("");
    
    // recursive call
    self(self); 
  }
);

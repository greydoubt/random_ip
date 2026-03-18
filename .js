((f) => f(f, self))(
  (self, n) => {
    if (n <= 0) return null;
    console.log(n);
    return self(self, n - 1);
  }
);

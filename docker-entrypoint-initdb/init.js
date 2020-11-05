db.createUser({
  user: "silemi5",
  pwd: "ocisly",
  roles: [
    {
      role: "readWrite",
      db: "wallet-api-db"
    }
  ]
})

db.createCollection("accounts");

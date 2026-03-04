const router = require("express").Router();
const {
  registerUser,
  loginUser,
  getUserById,
  getAllUsers,
  deleteUser,
} = require("../data/users");

router.post("/users/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const user = await registerUser(name, email, password, role);
    return res.status(201).json(user);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.post("/users/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await loginUser(email, password);
    return res.json({ loggedIn: true, user });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.get("/users/:id", async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    return res.json(user);
  } catch (err) {
    return res.status(404).json({ error: err.message });
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await getAllUsers();
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    const result = await deleteUser(req.params.id);
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

module.exports = router;


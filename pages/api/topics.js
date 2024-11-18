export default function handler(req, res) {
    if (req.method === 'POST') {
      // Handle saving topics (if you implement backend storage)
      res.status(200).json({ message: 'Success' })
    } else {
      res.status(405).json({ message: 'Method not allowed' })
    }
  }
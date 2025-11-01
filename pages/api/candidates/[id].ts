import type { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import clientPromise from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const db = client.db('PeopleDB');
    const collection = db.collection('Candidates');

    const { id } = req.query;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid candidate ID format' });
    }

    // GET by ID
    if (req.method === 'GET') {
      const candidate = await collection.findOne({ _id: new ObjectId(id as string) });
      if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
      return res.status(200).json(candidate);
    }

    // PUT (replace full doc)
    if (req.method === 'PUT') {
      const updated = { ...req.body, updatedAt: new Date() };
      const result = await collection.updateOne(
        { _id: new ObjectId(id as string) },
        { $set: updated }
      );
      if (result.matchedCount === 0)
        return res.status(404).json({ message: 'Candidate not found' });
      const candidate = await collection.findOne({ _id: new ObjectId(id as string) });
      return res.status(200).json(candidate);
    }

    // PATCH (partial update)
    if (req.method === 'PATCH') {
      const updates = { ...req.body, updatedAt: new Date() };
      const result = await collection.updateOne(
        { _id: new ObjectId(id as string) },
        { $set: updates }
      );
      if (result.matchedCount === 0)
        return res.status(404).json({ message: 'Candidate not found' });
      const candidate = await collection.findOne({ _id: new ObjectId(id as string) });
      return res.status(200).json(candidate);
    }

    // DELETE
    if (req.method === 'DELETE') {
      const result = await collection.deleteOne({ _id: new ObjectId(id as string) });
      if (result.deletedCount === 0)
        return res.status(404).json({ message: 'Candidate not found' });
      return res.status(204).end();
    }

    res.setHeader('Allow', ['GET', 'PUT', 'PATCH', 'DELETE']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  } catch (error) {
    console.error('❌ Error in [id] route:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
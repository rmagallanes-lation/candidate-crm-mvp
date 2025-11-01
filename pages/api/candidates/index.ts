import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const db = client.db('PeopleDB');
    const collection = db.collection('Candidates');

    if (req.method === 'GET') {
      const candidates = await collection.find({}).toArray();
      return res.status(200).json(candidates);
    }

    if (req.method === 'POST') {
      const payload = req.body;

      if (!payload || typeof payload !== 'object') {
        return res.status(400).json({ message: 'Invalid payload' });
      }

      const now = new Date();
      const newCandidate = {
        name: payload.name ?? '',
        lastName: payload.lastName ?? '',
        dateOfBirth: payload.dateOfBirth ?? null,
        email: payload.email ?? null,
        phone: payload.phone ?? null,
        linkedin: payload.linkedin ?? null,
        portfolio: payload.portfolio ?? null,
        location: payload.location ?? null,
        country: payload.country ?? null,
        available: payload.available ?? true,
        preferredRole: payload.preferredRole ?? null,
        workPreference: payload.workPreference ?? 'Remote',
        expectedSalary: payload.expectedSalary ?? null,
        skills: Array.isArray(payload.skills) ? payload.skills : [],
        tags: Array.isArray(payload.tags) ? payload.tags : [],
        status: payload.status ?? 'New',
        statusLog: Array.isArray(payload.statusLog) ? payload.statusLog : [],
        notes: payload.notes ?? '',
        source: payload.source ?? null,
        referredBy: payload.referredBy ?? null,
        addedBy: payload.addedBy ?? null,
        experience: Array.isArray(payload.experience) ? payload.experience : [],
        summary: payload.summary ?? null,
        embedding: Array.isArray(payload.embedding) ? payload.embedding : [],
        matchScores: Array.isArray(payload.matchScores) ? payload.matchScores : [],
        createdAt: now,
        updatedAt: now,
      };

      const { insertedId } = await collection.insertOne(newCandidate);
      const inserted = await collection.findOne({ _id: insertedId });

      return res.status(201).json(inserted);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  } catch (err) {
    console.error('❌ Error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
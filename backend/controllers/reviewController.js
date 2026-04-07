const db = require('../db');

exports.getReviews = async (req, res) => {
  try {
    const { business_id } = req.query;
    
    // Ensure the user owns the business accessing reviews
    let query = `
      SELECT r.* 
      FROM reviews r
      JOIN businesses b ON r.business_id = b.id
      WHERE b.user_id = ?
    `;
    const params = [req.user.id];

    if (business_id) {
      query += ' AND b.id = ?';
      params.push(business_id);
    }

    query += ' ORDER BY r.review_date DESC';

    const [reviews] = await db.query(query, params);
    
    // Map reviews and flag them as urgent if rating <= 2
    const annotatedReviews = reviews.map(r => ({
      ...r,
      is_urgent: r.rating <= 2
    }));

    res.json(annotatedReviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.addReview = async (req, res) => {
  try {
    const { business_id, platform, reviewer, rating, review_text, review_date } = req.body;

    // Verify user owns this business
    const [businesses] = await db.query('SELECT * FROM businesses WHERE id = ? AND user_id = ?', [business_id, req.user.id]);
    if (businesses.length === 0) {
      return res.status(403).json({ message: 'Not authorized for this business' });
    }

    const [result] = await db.query(
      'INSERT INTO reviews (business_id, platform, reviewer, rating, review_text, review_date) VALUES (?, ?, ?, ?, ?, ?)',
      [business_id, platform, reviewer, rating, review_text, review_date || new Date()]
    );

    const reviewId = result.insertId;

    // If rating <= 2, automatically mark as urgent by generating an alert
    if (rating <= 2) {
      await db.query(
        'INSERT INTO alerts (user_id, review_id, alert_type, message) VALUES (?, ?, ?, ?)',
        [req.user.id, reviewId, 'urgent', `Urgent: Received a ${rating}-star review from ${reviewer}.`]
      );
    }

    res.status(201).json({ id: reviewId, message: 'Review added successfully', is_urgent: rating <= 2 });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getStats = async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(r.id) AS total_reviews,
        AVG(r.rating) AS avg_rating,
        SUM(CASE WHEN r.status = 'replied' THEN 1 ELSE 0 END) AS total_replied,
        SUM(CASE WHEN r.rating <= 2 THEN 1 ELSE 0 END) AS total_urgent
      FROM reviews r
      JOIN businesses b ON r.business_id = b.id
      WHERE b.user_id = ?
    `, [req.user.id]);

    const result = stats[0];
    const total = result.total_reviews || 0;
    const replied = result.total_replied || 0;
    const repliedPercentage = total > 0 ? ((replied / total) * 100).toFixed(2) : 0;

    res.json({
      total_reviews: total,
      avg_rating: result.avg_rating ? parseFloat(result.avg_rating).toFixed(1) : 0,
      total_urgent: result.total_urgent || 0,
      replied_percentage: repliedPercentage
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

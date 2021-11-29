const dbService = require('../../services/db.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')

async function query(filterBy = {}) {
  try {
    const criteria = _buildCriteria(filterBy)

    const collection = await dbService.getCollection('review')

    var reviews = await collection
      .aggregate([
        {
          $match: criteria,
        },
        {
          $lookup: {
            localField: 'byUserId',
            from: 'user',
            foreignField: '_id',
            as: 'byUser',
          },
        },
        {
          $unwind: '$byUser',
        },
        {
          $lookup: {
            localField: 'aboutToyId',
            from: 'toy',
            foreignField: '_id',
            as: 'toy',
          },
        },
        {
          $unwind: '$toy',
        },
      ])
      .toArray()
    // reviews = reviews.map(review => {
    //   review.byUser = {
    //     _id: review.byUser._id,
    //     fullname: review.byUser.fullname,
    //   }
    //   review.aboutUser = {
    //     _id: review.aboutUser._id,
    //     fullname: review.aboutUser.fullname,
    //   }
    //   delete review.byUserId
    //   delete review.aboutUserId

    // return review
    // })
    console.log('REVIEWS', collection)

    return reviews
  } catch (err) {
    console.log('cannot find reviews', err)
    throw err
  }
}

async function remove(reviewId) {
  try {
    const store = asyncLocalStorage.getStore()
    const { userId, isAdmin } = store
    const collection = await dbService.getCollection('review')
    // remove only if user is owner/admin
    const criteria = { _id: ObjectId(reviewId) }
    if (!isAdmin) criteria.byUserId = ObjectId(userId)
    await collection.deleteOne(criteria)
  } catch (err) {
    logger.error(`cannot remove review ${reviewId}`, err)
    throw err
  }
}

async function add(review) {
  try {
    // peek only updatable fields!
    const reviewToAdd = {
      byUserId: ObjectId(review.byUserId),
      aboutToyId: ObjectId(review.aboutToyId),
      txt: review.txt,
      createdAt: Date.now(),
    }
    const collection = await dbService.getCollection('review')
    await collection.insertOne(reviewToAdd)
    return reviewToAdd
  } catch (err) {
    logger.error('cannot insert review', err)
    throw err
  }
}

function _buildCriteria(filterBy) {
  const criteria = { aboutToyId: ObjectId(filterBy.id) }
  return criteria
}

module.exports = {
  query,
  remove,
  add,
}

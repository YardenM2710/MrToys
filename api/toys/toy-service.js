const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId

module.exports = {
  query,
  getById,
  remove,
  add,
  update,
}

async function query(filterBy) {
  try {
    // const criteria = _buildCriteria(filterBy)
    const criteria = {}

    const collection = await dbService.getCollection('toy')
    var toys = await collection.find(criteria).toArray()

    let filteredToys = filterToys(filterBy, toys)

    return filteredToys
  } catch (err) {
    logger.error('cannot find toys', err)
    throw err
  }
}

async function getById(toyId) {
  try {
    const collection = await dbService.getCollection('toy')
    const toy = collection.findOne({ _id: ObjectId(toyId) })
    return toy
  } catch (err) {
    logger.error(`while finding toy ${toyId}`, err)
    throw err
  }
}

async function remove(toyId) {
  console.log('FROM service', toyId)

  try {
    const collection = await dbService.getCollection('toy')
    await collection.deleteOne({ _id: ObjectId(toyId) })
    return toyId
  } catch (err) {
    logger.error(`cannot remove toy ${toyId}`, err)
    throw err
  }
}

async function update(toy) {
  try {
    var id = ObjectId(toy._id)
    delete toy._id
    const collection = await dbService.getCollection('toy')
    const updatedToy = await collection.updateOne(
      { _id: id },
      { $set: { ...toy } }
    )
    return toy
  } catch (err) {
    logger.error(`cannot update toy ${toyId}`, err)
    throw err
  }
}

async function add(toy) {
  try {
    const collection = await dbService.getCollection('toy')
    console.log('23478 collection', collection)
    const addedToy = await collection.insertOne(toy)
    // console.log('addedToy:', addedToy)
    return toy
  } catch (err) {
    logger.error('cannot insert toy', err)
    throw err
  }
}

function filterToys(filterBy, toysToShow) {
  if (
    Object.keys(filterBy).length === 0 ||
    !filterBy ||
    (filterBy.title === '' && filterBy.label < 1)
  ) {
    return toysToShow
  }
  const searchStr = filterBy.title.toLowerCase()
  toysToShow = toysToShow.filter(toy => {
    return toy.name.toLowerCase().includes(searchStr)
  })
  const isInStock = filterBy.selectOpt === 'stock'

  toysToShow = toysToShow.filter(
    toy => filterBy.selectOpt === 'All' || toy.inStock === isInStock
  )

  console.log(toysToShow.length)
  if (!filterBy.labels) return toysToShow

  toysToShow = toysToShow.filter(toy => {
    return filterBy.labels.every(label => toy.labels.includes(label))
  })

  return toysToShow
}

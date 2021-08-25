const GSS = SpreadsheetApp.getActive()
const restaurantsSheet = GSS.getSheetByName('Restaurants')

const writeRestaurantsData = (restaurants) => {
  const pinCell = restaurantsSheet.createTextFinder('Finder01').findAll()
  let pinRow = restaurantsSheet.getLastRow() + 1
  const pinColumn = pinCell[0].getColumn()

  const time = new Date()

  restaurants.forEach((restaurant) => {
    restaurantsSheet.insertRowAfter(restaurantsSheet.getLastRow())

    restaurantsSheet.getRange(pinRow, pinColumn).setValue(restaurant.name)
    restaurantsSheet
      .getRange(pinRow, pinColumn + 1)
      .setValue(restaurant.category[0])
    restaurantsSheet
      .getRange(pinRow, pinColumn + 2)
      .setValue(restaurant.category[1])
    restaurantsSheet
      .getRange(pinRow, pinColumn + 3)
      .setValue(restaurant.distance)
    restaurantsSheet.getRange(pinRow, pinColumn + 4).setValue(restaurant.url)
    restaurantsSheet
      .getRange(pinRow, pinColumn + 5)
      .setValue(restaurant.address)
    restaurantsSheet.getRange(pinRow, pinColumn + 6).setValue(time)
    pinRow++
  })

  return 'end'
}

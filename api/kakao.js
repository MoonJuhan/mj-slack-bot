const axios = require('axios')

const KAKAO_KEY = process.env.kakao

const getRestaurantData = async (page) => {
  const kakaoUrl = 'https://dapi.kakao.com/v2/local/search/category.json'
  const companyX = parseFloat(process.env.companyX)
  const companyY = parseFloat(process.env.companyY)

  try {
    const { data } = await axios({
      method: 'get',
      url: kakaoUrl,
      headers: {
        Authorization: `KakaoAK ${KAKAO_KEY}`,
      },
      params: {
        category_group_code: 'FD6',
        x: companyX,
        y: companyY,
        radius: 500,
        sort: 'distance',
        page,
      },
    })

    const refineDistance = (x, y) => {
      const distanceX = Math.abs((companyX - parseFloat(x)) * 100000)
      const distanceY = Math.abs((companyY - parseFloat(y)) * 100000)

      return Math.floor(
        Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2))
      )
    }

    const refineData = data.documents.map((el) => {
      return {
        name: el.place_name,
        category: refineCategory(el.category_name),
        url: el.place_url,
        distance: el.distance,
        // distance: refineDistance(el.x, el.y),
        address: el.road_address_name,
      }
    })

    return { isEnd: data.meta.is_end, newData: refineData }
  } catch (error) {
    console.log(error)
    return []
  }
}

const refineCategory = (string) => {
  return string.split(' > ').filter((el) => el !== '음식점')
}

module.exports = getRestaurantData

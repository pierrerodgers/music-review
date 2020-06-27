# Database plan

## Object brainstorm

**! denotes required var, ? denotes optional** 

**FOR BELOW:** < Property > : < Type > < optional >
- Artist
  - ID !
  - Name : String ! 
  - Albums/releases : [ Album ] ! 
  - Bio : String ? 
  - Genres : [ String ] ?
  - Links to music services : [ String ] ?

- Albums/releases
  - ID ! 
  - Name : String ! 
  - Artist : [ Artist ] !
  - Genres : [ String ] ?
  - Reviews : [ Review ] ?
  - Links to albums in music services : [ String ] ?

- Review
  - ID !
  - Reviewer : Reviewer !
  - Score : Score !
  - Artist : Artist !
  - Album : Album !
  - Date : Date !
  - Link : String !
  - Body : String ?

- Reviewer
  - ID !
  - Name : String !
  - Reviews : [ Review ] !
  - Link : String !

- Score
  - Type enum : String ! (i.e. stars, out of 10, out of 100)
  - Value : Number !
  
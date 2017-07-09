class Users {
    constructor(){
            this.users = []
    
            this.getUser = this.getUser.bind(this)
            this.getUserList = this.getUserList.bind(this)
            this.addUser = this.addUser.bind(this)
            this.removeUser = this.removeUser.bind(this)
        }

    getUser(id){
            return this.users.filter((user) => user.id === id)[0]
        }

    getUserList(){
            var users = this.users
            var namesArray = users.map((user) => user.name)
    
            return namesArray
        }
    
    addUser(id,name){
            var user = {id, name}
            this.users.push(user)
            return user
        }

    removeUser(id){
            var user = this.getUser(id)
    
            if (user){
                        this.users = this.users.filter((user) => user.id !== id)
                    }

        return user
    }

}

module.exports = {Users}

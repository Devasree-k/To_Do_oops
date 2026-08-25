class User{
    constructor(data={},objectName="users"){
        this.id=data.id||"";
        this.name=data.name||"";
        this.email=data.email||"";
        this.profileImage=data.profileImage||"";
        this.password=data.password||"";
        this.age=data.age||"";
        this.phone=data.phone||"";
        this.dob=data.dob||"";
        this.country=data.country||"";
        this.gender=data.gender||"";
        this.skills=data.skills||[];
        this.address=data.address||"";
        this.createdAt=data.createdAt||"";
        this.objectName=objectName;
    }

    async getAll(){
        return apiRequest(USERS_URL);
    }

    async getById(id){
        return apiRequest(`${USERS_URL}/${id}`);
    }

    async findByEmail(email){
        const users=await apiRequest(`${USERS_URL}?email=${encodeURIComponent(email.toLowerCase())}`);
        return users[0]||null;
    }

    async create(){
        const createdUser=await apiRequest(USERS_URL,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify(this.toJSON())
        });
        return createdUser;
    }

    async update(id=this.id){
        return apiRequest(`${USERS_URL}/${id}`,{
            method:"PATCH",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify(this.toJSON())
        });
    }

    toJSON(){
        const data={...this};
        delete data.objectName;
        return data;
    }
}

const userService=new User();
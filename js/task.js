class Task{
    constructor(data={},objectName="tasks"){
        this.id=data.id||"";
        this.userId=data.userId||"";
        this.title=data.title||"";
        this.description=data.description||"";
        this.time=data.time||"";
        this.date=data.date||"";
        this.priority=data.priority||"Low";
        this.completed=data.completed||false;
        this.deleted=Boolean(data.deleted);
        this.createdAt=data.createdAt||"";
        this.updatedAt=data.updatedAt||"";
        this.objectName=objectName;
    }

    async getAll(){
        return apiRequest(TASKS_URL);
    }

    async getById(id){
        return apiRequest(`${TASKS_URL}/${id}`);
    }

    async getByUserId(userId){
        return apiRequest(`${TASKS_URL}?userId=${encodeURIComponent(userId)}`);
    }

    async create(){
        const createdTask=await apiRequest(TASKS_URL,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify(this.toJSON())
        });
        return createdTask;
    }

    async update(id=this.id,data=this.toJSON()){
        return apiRequest(`${TASKS_URL}/${id}`,{
            method:"PATCH",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify(data)
        });
    }

    toJSON(){
        const data={...this};
        delete data.objectName;
        return data;
    }
}

const taskService=new Task();
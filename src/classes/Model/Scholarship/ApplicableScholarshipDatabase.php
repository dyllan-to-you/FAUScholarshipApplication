<?php
namespace ScholarshipApi\Model\Scholarship;

use ScholarshipApi\Model\Requirement\RequirementStore;
use ScholarshipApi\Model\ScholarshipQuestion\ScholarshipQuestionStore;

class ApplicableScholarshipDatabase implements ScholarshipStore{
    var $db;
    var $factory;
    var $requirements;
    var $questions;

    function __construct(\PDO $db, RequirementStore $requirements, ScholarshipQuestionStore $questions){
        $this->db = $db;
        $this->factory = new ScholarshipFactory($requirements, $questions);
        $this->requirements = $requirements;
        $this->questions = $questions;
    }

    function getAll(){
        $query = "SELECT s.id, s.code, s.name, s.description, s.active, s.max
                    FROM `scholarship` s";
        $result = $this->db->query($query)->fetchAll();

        return $this->factory->bulkInitialize($result);
    }

    function get($code){
        $query = "SELECT s.id, s.code, s.name, s.description, s.active, s.max
                    FROM `scholarship` s 
                    WHERE s.code = :code";
        $stmnt = $this->db->prepare($query);

        $stmnt->bindParam(':code', $code, \PDO::PARAM_STR);
        $stmnt->execute();
        $result = $stmnt->fetch();

        if(is_null($result)){
            throw new \OutOfBoundsException ("Scholarship '$code' doesn't exist.");
        }

        return $this->factory->initialize($result);
    }

    public function save($sch){
        try{
            $this->db->beginTransaction();

            $query = "INSERT INTO `scholarship` (`id`,`code`,`name`,`description`,`active`,`max`)
                VALUES (:id, :code, :name, :description, :active, :max)
                ON DUPLICATE KEY UPDATE 
                    code=VALUES(code), name=VALUES(name), description=VALUES(description), 
                    active=VALUES(active), max=VALUES(max)";
            $stmnt = $this->db->prepare($query);

            $stmnt->bindParam(':id', $sch['id'], \PDO::PARAM_INT);
            $stmnt->bindParam(':code', $sch['code'], \PDO::PARAM_STR);
            $stmnt->bindParam(':name', $sch['name'], \PDO::PARAM_STR);
            $stmnt->bindParam(':description', $sch['description'], \PDO::PARAM_STR);
            $stmnt->bindParam(':active', $sch['active'], \PDO::PARAM_INT);
            $stmnt->bindParam(':max', $sch['max'], \PDO::PARAM_INT);
            $stmnt->execute();

            $this->questions->save([$sch['code'] => $sch['questions']]);
            $this->requirements->save([$sch['code']=> $sch['requirements']]);

            $this->db->commit();
        } catch(Exception $ex){
            $this->db->rollBack();
            throw $ex;
        }

        return $sch['code'];
    } 

    public function delete($sch){
        
    }
}
